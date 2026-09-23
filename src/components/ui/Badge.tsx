export function Badge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <span
      className="
        absolute -top-1 -right-1
        flex h-4 min-w-[16px] items-center justify-center
        rounded-full bg-red-500 px-[3px]
        text-[9px] font-bold leading-none text-white
      "
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}