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

function SortableProjectItem({ id, index, remove }: { id: string; index: number; remove: (index: number) => void }) {
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

  const projErrors = (errors.projects as any)?.[index];

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
          <Label>Project Name</Label>
          <Input {...register(`projects.${index}.name`)} placeholder="Portfolio Website" className="text-lg py-6" />
          {projErrors?.name && <p className="text-sm text-red-500">{projErrors.name.message}</p>}
        </div>

        <div className="space-y-2 flex flex-col">
          <div className="flex flex-col mb-4">
            <Label>Role (Optional)</Label>
            <Input {...register(`projects.${index}.role`)} placeholder="Lead Developer" className="text-lg py-6 mt-2" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="month" {...register(`projects.${index}.startDate`)} className="text-lg py-6" />
          {projErrors?.startDate && <p className="text-sm text-red-500">{projErrors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="month" {...register(`projects.${index}.endDate`)} className="text-lg py-6" />
          {projErrors?.endDate && <p className="text-sm text-red-500">{projErrors.endDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Live Link (Optional)</Label>
          <Input {...register(`projects.${index}.liveLink`)} placeholder="https://my-portfolio.com" className="text-lg py-6" />
        </div>

        <div className="space-y-2">
          <Label>GitHub Link (Optional)</Label>
          <Input {...register(`projects.${index}.githubLink`)} placeholder="https://github.com/..." className="text-lg py-6" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          {...register(`projects.${index}.description`)} 
          placeholder="- Built using Next.js...\n- Achieved 100% lighthouse score..." 
          rows={5}
          className="text-lg"
        />
        {projErrors?.description && <p className="text-sm text-red-500">{projErrors.description.message}</p>}
      </div>
    </div>
  );
}

export function ProjectsStep() {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
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
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button
          type="button"
          onClick={() => append({ name: "", role: "", startDate: "", endDate: "", liveLink: "", githubLink: "", description: "" })}
          size="sm"
          className="gap-2"
        >
          <Plus size={16} /> Add Project
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableProjectItem key={field.id} id={field.id} index={index} remove={remove} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
