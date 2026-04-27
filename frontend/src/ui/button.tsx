import { Button as RadixButton } from "@radix-ui/themes";
import type { ButtonProps } from "@radix-ui/themes";
import { forwardRef, type ComponentRef } from "react";

export type UiButtonProps = ButtonProps;

export const Button = forwardRef<
  ComponentRef<typeof RadixButton>,
  UiButtonProps
>(function Button(
  { className, variant = "solid", color = "indigo", ...props },
  ref
) {
  return (
    <RadixButton
      ref={ref}
      {...props}
      variant={variant}
      color={color}
      className={["ui-button", className].filter(Boolean).join(" ")}
    />
  );
});
