import { useState } from "react";
import { Navigation } from "../../components/navigation";

const items = ["Home", "Docs", "About"];

export default function Example() {
  const [active, setActive] = useState("Home");

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Navigation>
          <Navigation.List>
            {items.map((item) => (
              <Navigation.Item key={item}>
                <Navigation.Link
                  href={`#${item.toLowerCase()}`}
                  active={active === item}
                  onClick={() => setActive(item)}
                >
                  {item}
                </Navigation.Link>
              </Navigation.Item>
            ))}
          </Navigation.List>
        </Navigation>
      </div>
    </div>
  );
}
