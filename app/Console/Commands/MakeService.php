<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:service {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Service class';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $className = Str::studly($name);
        $servicePath = app_path('Services');
        $filePath = $servicePath . '/' . $className . '.php';

        if (!File::exists($servicePath)) {
            File::makeDirectory($servicePath, 0755, true);
        }

        if (File::exists($filePath)) {
            $this->error("Service class {$className} already exists!");
            return;
        }

        $stubPath = base_path('stubs/service.stub');

        if (!File::exists($stubPath)) {
            $this->error("Stub file not found at {$stubPath}");
            return;
        }

        $stub = File::get($stubPath);

        $stub = str_replace('{{ class }}', $className, $stub);

        File::put($filePath, $stub);

        $this->info("Service class {$className} created succesfully at {$filePath}");
    }
}
