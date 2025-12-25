interface Component {
  name: string;
  description: string;
}

interface ComponentListProps {
  components: Component[];
}

export function ComponentList({ components }: ComponentListProps) {
  return (
    <ul className="list-none p-0 m-0">
      {components.map((c) => (
        <li key={c.name} className="border-b border-[var(--chrome)]">
          <a
            href={`/ui/components/${c.name}`}
            className="flex items-center justify-between py-3 no-underline hover:bg-[var(--frost)] transition-colors"
          >
            <span className="font-medium text-[var(--ink)]">
              {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
            </span>
            <span className="text-[var(--steel)]">→</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
