import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function SkillsStep() {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <Button
          type="button"
          onClick={() => append({ heading: "", skills: "" })}
          size="sm"
          className="gap-2"
        >
          <Plus size={16} /> Add Skill Group
        </Button>
      </div>

      {fields.map((field, index) => {
        const skillErrors = (errors.skills as any)?.[index];
        return (
          <div key={field.id} className="p-4 border border-foreground/20 rounded-xl bg-card gap-4 relative mb-6 pt-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 absolute top-2 right-2"
              onClick={() => remove(index)}
            >
              <Trash2 size={16} />
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="space-y-4">
                <Label className="text-lg">Skill Heading (e.g., Languages, Frameworks)</Label>
                <Input 
                  {...register(`skills.${index}.heading`)} 
                  placeholder="Languages" 
                  className="text-lg py-6"
                />
                {skillErrors?.heading && <p className="text-sm text-red-500">{skillErrors.heading.message}</p>}
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label className="text-lg">Skills (Separate by comma)</Label>
                <Textarea 
                  {...register(`skills.${index}.skills`)} 
                  placeholder="JavaScript, TypeScript, Python..." 
                  rows={2}
                  className="text-lg py-4"
                />
                {skillErrors?.skills && <p className="text-sm text-red-500">{skillErrors.skills.message}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
