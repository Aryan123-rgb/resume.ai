import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableEducationItem({ id, index, remove }: { id: string; index: number; remove: (index: number) => void }) {
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

  const eduErrors = (errors.education as any)?.[index];

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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Institute Name</Label>
          <Input {...register(`education.${index}.institute`)} placeholder="University Name" className="text-lg py-6" />
          {eduErrors?.institute && <p className="text-sm text-red-500">{eduErrors.institute.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Branch</Label>
          <Input {...register(`education.${index}.branch`)} placeholder="Computer Science" className="text-lg py-6" />
          {eduErrors?.branch && <p className="text-sm text-red-500">{eduErrors.branch.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="month" {...register(`education.${index}.startDate`)} className="text-lg py-6" />
            {eduErrors?.startDate && <p className="text-sm text-red-500">{eduErrors.startDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>End Date (expected)</Label>
            <Input type="month" {...register(`education.${index}.endDate`)} className="text-lg py-6" />
            {eduErrors?.endDate && <p className="text-sm text-red-500">{eduErrors.endDate.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EducationStep() {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
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
        <h2 className="text-xl font-semibold">Education Details</h2>
        <Button
          type="button"
          onClick={() => append({ institute: "", branch: "", startDate: "", endDate: "" })}
          size="sm"
          className="gap-2"
        >
          <Plus size={16} /> Add Education
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableEducationItem key={field.id} id={field.id} index={index} remove={remove} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
