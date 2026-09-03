import { useState } from "react";
import { Breadcrumb } from "../../components/breadcrumb";

const items = ["Home", "Documentation", "Components"];

export default function Example() {
  const [active, setActive] = useState("Components");

  return (
    <Breadcrumb>
      <Breadcrumb.List>
        {items.map((item, index) => (
          <Breadcrumb.Item key={item}>
            {index > 0 && <Breadcrumb.Separator />}
            {active === item ? (
              <Breadcrumb.Page>{item}</Breadcrumb.Page>
            ) : (
              <Breadcrumb.Link href={`#${item.toLowerCase()}`} onClick={() => setActive(item)}>
                {item}
              </Breadcrumb.Link>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb.List>
    </Breadcrumb>
  );
}
