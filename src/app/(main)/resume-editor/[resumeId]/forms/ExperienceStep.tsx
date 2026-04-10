import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableExperienceItem({ id, index, remove }: { id: string; index: number; remove: (index: number) => void }) {
  const { register, formState: { errors } } = useFormContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const expErrors = (errors.experience as any)?.[index];

  return (
    <div ref={setNodeRef} style={style} className="p-4 border border-foreground/20 rounded-xl bg-card relative mb-6">
      <div className="flex justify-between items-center mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm select-none"
        >
          <GripVertical size={16} /> <span>Grab</span>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-500 h-8 gap-2"
          onClick={() => remove(index)}
        >
          <X size={16} /> <span>Remove</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input {...register(`experience.${index}.company`)} placeholder="Google" className="text-lg py-6" />
          {expErrors?.company && <p className="text-sm text-red-500">{expErrors.company.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Input {...register(`experience.${index}.role`)} placeholder="Software Engineer" className="text-lg py-6" />
          {expErrors?.role && <p className="text-sm text-red-500">{expErrors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="month" {...register(`experience.${index}.startDate`)} className="text-lg py-6" />
          {expErrors?.startDate && <p className="text-sm text-red-500">{expErrors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>End Date (expected)</Label>
          <Input type="month" {...register(`experience.${index}.endDate`)} className="text-lg py-6" />
          {expErrors?.endDate && <p className="text-sm text-red-500">{expErrors.endDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          {...register(`experience.${index}.description`)} 
          placeholder="- Developed new features...\n- Optimized performance..." 
          rows={5}
          className="text-lg"
        />
        {expErrors?.description && <p className="text-sm text-red-500">{expErrors.description.message}</p>}
      </div>
    </div>
  );
}

export function ExperienceStep() {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experience",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        <Button
          type="button"
          onClick={() => append({ company: "", role: "", startDate: "", endDate: "", description: "" })}
          size="sm"
          className="gap-2"
        >
          <Plus size={16} /> Add Experience
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableExperienceItem key={field.id} id={field.id} index={index} remove={remove} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
