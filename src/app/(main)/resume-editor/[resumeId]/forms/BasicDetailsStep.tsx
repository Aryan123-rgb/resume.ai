import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function BasicDetailsStep() {
  const { register, formState: { errors } } = useFormContext();
  const basicErrors = errors.basics as any;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-semibold mb-4">Bio Section</h2>
      
      <div className="space-y-2">
        <Label className="text-lg" htmlFor="basics.name">Name</Label>
        <Input id="basics.name" {...register("basics.name")} placeholder="John Doe" className="text-lg py-6" />
        {basicErrors?.name && <p className="text-sm text-red-500">{basicErrors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.email">Email</Label>
          <Input id="basics.email" type="email" {...register("basics.email")} placeholder="john@example.com" className="text-lg py-6" />
          {basicErrors?.email && <p className="text-sm text-red-500">{basicErrors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.contact">Contact Number</Label>
          <Input id="basics.contact" {...register("basics.contact")} placeholder="+1 234 567 8900" className="text-lg py-6" />
          {basicErrors?.contact && <p className="text-sm text-red-500">{basicErrors.contact.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.linkedin">LinkedIn URL</Label>
          <Input id="basics.linkedin" {...register("basics.linkedin")} placeholder="https://linkedin.com/in/..." className="text-lg py-6" />
          {basicErrors?.linkedin && <p className="text-sm text-red-500">{basicErrors.linkedin.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.github">Github URL (optional)</Label>
          <Input id="basics.github" {...register("basics.github")} placeholder="https://github.com/..." className="text-lg py-6" />
          {basicErrors?.github && <p className="text-sm text-red-500">{basicErrors.github.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.codeforces">Codeforces URL (optional)</Label>
          <Input id="basics.codeforces" {...register("basics.codeforces")} placeholder="https://codeforces.com/profile/..." className="text-lg py-6" />
          {basicErrors?.codeforces && <p className="text-sm text-red-500">{basicErrors.codeforces.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.codechef">Codechef URL (optional)</Label>
          <Input id="basics.codechef" {...register("basics.codechef")} placeholder="https://www.codechef.com/users/..." className="text-lg py-6" />
          {basicErrors?.codechef && <p className="text-sm text-red-500">{basicErrors.codechef.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.geeksforgeeks">GeeksforGeeks URL (optional)</Label>
          <Input id="basics.geeksforgeeks" {...register("basics.geeksforgeeks")} placeholder="https://auth.geeksforgeeks.org/user/..." className="text-lg py-6" />
          {basicErrors?.geeksforgeeks && <p className="text-sm text-red-500">{basicErrors.geeksforgeeks.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-lg" htmlFor="basics.leetcode">Leetcode URL (optional)</Label>
          <Input id="basics.leetcode" {...register("basics.leetcode")} placeholder="https://leetcode.com/..." className="text-lg py-6" />
          {basicErrors?.leetcode && <p className="text-sm text-red-500">{basicErrors.leetcode.message}</p>}
        </div>
      </div>


    </div>
  );
}
