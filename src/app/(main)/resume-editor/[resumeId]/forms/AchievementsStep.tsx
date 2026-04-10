import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AchievementsStep() {
  const { register, formState: { errors } } = useFormContext();
  const achievementErrors = errors.achievements as any;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-semibold mb-4">Achievements</h2>
      
      <div className="space-y-2">
        <Label className="text-lg">List your achievements (Separate by new line)</Label>
        <Textarea 
          id="achievements"
          {...register("achievements.achievements")} 
          placeholder="- Secured 1st rank in coding competition...\n- Won Hackathon..." 
          rows={12}
          className="text-lg py-4"
        />
        {achievementErrors?.achievements && <p className="text-sm text-red-500">{achievementErrors.achievements.message}</p>}
      </div>
    </div>
  );
}
