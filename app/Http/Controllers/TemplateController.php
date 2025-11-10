<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTemplateRequest;
use App\Http\Requests\UpdateTemplateRequest;
use App\Models\Aspect;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class TemplateController extends Controller
{
    public function index(Request $request) 
    {
        $perPage = $request->get('per_page', 15);
        $q = $request->get('q');

        $templates = Template::with('latestTemplateVersion.aspects.latestAspectVersion')
            ->when($q, function ($query) use ($q) {
                $query->whereHas('latestTemplateVersion', function ($sub) use ($q) {
                    $sub->where('name', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate($perPage);

        return Inertia::render('template/index', [
            'templates' => $templates,
            'filters' => [ 'q' => $q ],
        ]);
    }

    public function create() 
    {
        $aspects = Aspect::with('latestAspectVersion')->get();

        return Inertia::render('template/create', [
            'aspects' => $aspects,
        ]);
    }

    public function store(StoreTemplateRequest $request)
    {
        try {
            $validated = $request->validated();
            
            DB::transaction(function () use ($validated) {
                $template = Template::create([]);

                $templateVersion = $template->templateVersions()->create([
                    'version_number' => 1,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                if (!empty($validated['selected_aspects'])) {
                    $aspectDataToAttach = collect($validated['selected_aspects'])->mapWithKeys(function ($aspectData) {
                        return [$aspectData['id'] => ['weight' => $aspectData['weight']]];
                    });

                    $templateVersion->aspects()->attach($aspectDataToAttach);
                }

                if (!empty($validated['visibility_rules'])) {
                    $templateVersion->visibilityRules()->createMany($validated['visibility_rules']);
                }
            });

            return redirect()->route('templates.index')->with('success', "Template berhasil dibuat.");
        } catch (Throwable $e) {
            Log::error('Error storing template', ['exception' => $e]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    public function show(Template $template)
    {
        $template->load(['latestTemplateVersion.aspects.latestAspectVersion','latestTemplateVersion.visibilityRules']);

        return Inertia::render('template/show', [
            'template' => $template
        ]);
    }

    public function edit(Template $template)
    {
        $aspects = Aspect::with('latestAspectVersion')->get();
        $template->load(['latestTemplateVersion.aspects.latestAspectVersion', 'latestTemplateVersion.visibilityRules']);

        return Inertia::render('template/edit', [
            'aspects' => $aspects,
            'template' => $template
        ]);
    }

    public function update(UpdateTemplateRequest $request, Template $template)
    {
        try {
            $validated = $request->validated();

            DB::transaction(function () use ($validated, $template) {
                $latestVersion = $template->latestTemplateVersion;
                $newVersionNumber = $latestVersion ? $latestVersion->version_number + 1 : 1;

                $templateVersion = $template->templateVersions()->create([
                    'version_number' => $newVersionNumber,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                if (!empty($validated['selected_aspects'])) {
                    $aspectDataToSync = collect($validated['selected_aspects'])->mapWithKeys(function ($aspectData) {
                        return [$aspectData['id'] => ['weight' => $aspectData['weight']]];
                    });

                    $templateVersion->aspects()->sync($aspectDataToSync);
                } else {
                    $templateVersion->aspects()->detach();
                }

                if ($latestVersion && $latestVersion->visibilityRules->isNotEmpty()) {
                    $latestVersion->visibilityRules()->delete();
                }

                if (!empty($validated['visibility_rules'])) {
                    $templateVersion->visibilityRules()->createMany($validated['visibility_rules']);
                }
            });

            return redirect()->route('templates.index')->with('success', "Template berhasil diperbarui.");
        } catch (Throwable $e) {
            Log::error('Error updating template', ['exception' => $e]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data.');
        }
    }

    public function destroy(Template $template)
    {
        $template->delete();

        return redirect()->route('templates.index')->with('success', 'Template berhasil dihapus.');
    }
}
