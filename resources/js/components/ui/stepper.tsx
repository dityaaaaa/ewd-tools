"use client"

import * as React from "react"
import { Check, ChevronRight, IdCard, Calculator, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface StepProps {
    title: string;
    description?: string;
    isCompleted?: boolean;
    isActive?: boolean;
    icon?: React.ElementType;
}

const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive, icon: Icon }) => {
    return (
        <div className="flex flex-col items-center text-center w-full">
            <div className="relative flex items-center justify-center">
                <div
                    className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isCompleted
                            ? "border-[#2E3192] bg-[#2E3192] text-white shadow-md"
                            : isActive
                                ? "border-[#1A1D68] bg-[#1A1D68] text-white shadow-lg"
                                : "border-gray-300 bg-transparent text-gray-500",
                    )}
                >
                    {isCompleted ? <Check className="w-5 h-5" /> : (Icon ? <Icon className="w-5 h-5" /> : <span className="text-base font-medium">{title[0]}</span>)}
                </div>
            </div>
            <div className="mt-2">
                <p className={cn("text-sm font-medium", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}>
                    {title}
                </p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
        </div>
    )
}

interface StepperProps {
    steps: Array<{ title: string; description?: string; icon?: React.ElementType }>;
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                        <Step
                            title={step.title}
                            description={step.description}
                            isCompleted={index < currentStep}
                            isActive={index === currentStep}
                            icon={step.icon}
                        />
                        {index < steps.length - 1 && (
                            <div className={cn("flex-auto h-1.5 rounded-full mx-1 transition-colors duration-300", index < currentStep ? "bg-[#2E3192]" : "bg-gray-300")}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
