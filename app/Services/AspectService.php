<?php

namespace App\Services;

use App\Models\Aspect;
use App\Models\Question;
use App\Models\QuestionVersion;
use Illuminate\Support\Facades\DB;

class AspectService extends BaseService
{
    public function getAllAspects($perPage = 15, array $filters = [])
    {
        $this->authorize('view aspect');
        $query = Aspect::with('latestAspectVersion', 'latestAspectVersion.questionVersions')
            ->latest();

        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('code', 'like', "%{$q}%")
                    ->orWhereHas('latestAspectVersion', function ($v) use ($q) {
                        $v->where('name', 'like', "%{$q}%");
                    });
            });
        }

        return $query->paginate($perPage);
    }

    public function getAspectById(int $id): Aspect
    {
        $this->authorize('view aspect');

        return Aspect::with([
            'latestAspectVersion',
            'latestAspectVersion.questionVersions.questionOptions',
            'latestAspectVersion.questionVersions.visibilityRules'
        ])->findOrFail($id);
    }

    public function store(array $validated): void
    {
        $this->authorize('create aspect');

        DB::transaction(function () use ($validated) {
            $aspect = Aspect::create(['code' => $validated['code']]);

            $aspectVersion = $aspect->aspectVersions()->create([
                'version_number' => 1,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $indexToQuestionIdMap = [];
            $indexToQuestionVersionIdMap = [];

            foreach ($validated['questions'] as $index => $q) {
                $question = Question::create([]);

                $questionVersion = $question->questionVersions()->create([
                    'aspect_version_id' => $aspectVersion->id,
                    'version_number' => 1,
                    'question_text' => $q['question_text'],
                    'weight' => $q['weight'],
                    'is_mandatory' => $q['is_mandatory'],
                ]);

                $indexToQuestionIdMap[$index] = $question->id;
                $indexToQuestionVersionIdMap[$index] = $questionVersion->id;

                if (!empty($q['options'])) {
                    foreach ($q['options'] as $opt) {
                        $questionVersion->questionOptions()->create([
                            'option_text' => $opt['option_text'],
                            'score' => $opt['score']
                        ]);
                    };
                }
            }

            foreach ($validated['questions'] as $index => $q) {
                if (!empty($q['visibility_rules'])) {
                    $questionVersionId = $indexToQuestionVersionIdMap[$index];
                    $questionVersion = QuestionVersion::find($questionVersionId);

                    $translatedRules = [];

                    foreach ($q['visibility_rules'] as $rule) {
                        if ($rule['source_type'] === 'answer') {
                            $sourceIndex = (int)$rule['source_field'];
                            $rule['source_field'] = $indexToQuestionIdMap[$sourceIndex];
                        }
                        $translatedRules[] = $rule;
                    }
                    $questionVersion->visibilityRules()->createMany($translatedRules);
                }
            }
        });
    }

    public function update(array $validated, Aspect $aspect): void
    {
        $this->authorize('update aspect');

        DB::transaction(function () use ($validated, $aspect) {
            $latestVersion = $aspect->aspectVersions()->latest('version_number')->first();
            $newVersionNumber = $latestVersion ? $latestVersion->version_number + 1 : 1;

            $aspectVersion = $aspect->aspectVersions()->create([
                'version_number' => $newVersionNumber,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $indexToQuestionIdMap = [];
            $indexToQuestionVersionIdMap = [];

            foreach ($validated['questions'] as $index => $q) {
                $question = Question::create([]);

                $questionVersion = $question->questionVersions()->create([
                    'aspect_version_id' => $aspectVersion->id,
                    'version_number' => 1,
                    'question_text' => $q['question_text'],
                    'weight' => $q['weight'],
                    'is_mandatory' => $q['is_mandatory'],
                ]);

                $indexToQuestionIdMap[$index] = $question->id;
                $indexToQuestionVersionIdMap[$index] = $questionVersion->id;

                if (!empty($q['options'])) {
                    foreach ($q['options'] as $opt) {
                        $questionVersion->questionOptions()->create([
                            'option_text' => $opt['option_text'],
                            'score' => $opt['score'],
                        ]);
                    }
                }
            }

            foreach ($validated['questions'] as $index => $q) {
                if (!empty($q['visibility_rules'])) {
                    $questionVersionId = $indexToQuestionVersionIdMap[$index];
                    $questionVersion = QuestionVersion::find($questionVersionId);

                    $translatedRules = [];

                    foreach ($q['visibility_rules'] as $rule) {
                        if ($rule['source_type'] === 'answer') {
                            if (is_string($rule['source_field'])) {
                                if (preg_match('/(\d+)/', $rule['source_field'], $matches)) {
                                    $rule['source_field'] = ((int) $matches[1] - 1);
                                } else {
                                    $rule['source_field'] = 0;
                                }
                            }

                            $sourceIndex = (int)$rule['source_field'];
                            if ($sourceIndex === $index) {
                                logger()->warning("Question {$index} references itself, skipping rule.");
                                continue;
                            }
                            if (isset($indexToQuestionIdMap[$sourceIndex])) {
                                $rule['source_field'] = $indexToQuestionIdMap[$sourceIndex];
                            } else {
                                logger()->warning("Invalid source index {$sourceIndex} for visibility rule", [
                                    'available' => $indexToQuestionIdMap,
                                ]);
                            }
                        }
                        $translatedRules[] = $rule;
                    }
                    $questionVersion->visibilityRules()->createMany($translatedRules);
                }
            }
        });
    }

    public function destroy(Aspect $aspect): void
    {
        $this->authorize('delete aspect');
        $aspect->delete();
    }
}