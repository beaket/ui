interface Component {
  name: string;
  description: string;
}

interface ComponentListProps {
  components: Component[];
}

export function ComponentList({ components }: ComponentListProps) {
  return (
    <ul className="m-0 list-none p-0 text-xs">
      {components.map((c) => (
        <li key={c.name} className="border-b border-[var(--chrome)]">
          <a
            href={`/ui/components/${c.name}`}
            className="flex items-center justify-between py-1 no-underline hover:bg-[var(--frost)]"
          >
            <span className="text-[var(--ink)]">{c.name}</span>
            <span className="text-[var(--steel)]">→</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
