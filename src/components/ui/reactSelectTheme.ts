import type { ClassNamesConfig, GroupBase } from "react-select";

/**
 * Tailwind-classNames für react-select im FCB-Design. Mit <Select unstyled
 * classNames={reactSelectClassNames()} /> nutzen, damit nur diese Tokens greifen
 * (theme-fähig über semantische fcb-*-Tokens). Generisch über Option-Typ.
 */
export function reactSelectClassNames<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(): ClassNamesConfig<Option, IsMulti, Group> {
  return {
    control: ({ isFocused }) =>
      `rounded-lg border bg-fcb-bg px-1 py-1 text-sm transition-colors ${
        isFocused ? "border-fcb-blue ring-2 ring-fcb-blue/40" : "border-fcb-border"
      }`,
    valueContainer: () => "gap-1 px-1",
    placeholder: () => "text-fcb-muted/60 font-inter",
    input: () => "text-fcb-text font-inter",
    singleValue: () => "text-fcb-text font-inter",
    multiValue: () => "rounded bg-fcb-surface border border-fcb-border",
    multiValueLabel: () => "text-fcb-text font-inter px-1.5 py-0.5",
    multiValueRemove: () => "text-fcb-muted hover:text-fcb-red px-1",
    menu: () => "mt-1 rounded-lg border border-fcb-border bg-fcb-surface overflow-hidden",
    option: ({ isFocused, isSelected }) =>
      `px-3 py-2 text-sm font-inter cursor-pointer ${
        isSelected
          ? "bg-fcb-blue text-white"
          : isFocused
            ? "bg-fcb-border text-fcb-text"
            : "text-fcb-text"
      }`,
    indicatorsContainer: () => "text-fcb-muted",
    dropdownIndicator: () => "px-2",
    clearIndicator: () => "px-2 hover:text-fcb-red",
    indicatorSeparator: () => "bg-fcb-border",
    noOptionsMessage: () => "text-fcb-muted font-inter py-2",
  };
}
