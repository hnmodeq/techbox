import { cn } from "@/lib/utils";
import { TechboxInlineLoader, TechboxLoader } from "@/components/ui/techbox-loader";

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return <TechboxInlineLoader data-slot="spinner" className={cn("shrink-0", className)} {...props} />;
}

function SpinnerCenter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <TechboxLoader />
    </div>
  );
}

export { Spinner, SpinnerCenter };
