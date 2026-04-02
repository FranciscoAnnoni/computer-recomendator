export function CompareSpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 text-[12px] font-mono text-foreground leading-none border-t border-border">
      [ {label}: {value} ]
    </div>
  );
}
