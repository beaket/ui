import { RadioGroup, RadioItem } from "../../components/radio";

export default () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Horizontal</span>
      <RadioGroup defaultValue="option1" aria-label="Horizontal options">
        <div className="flex items-center gap-1">
          <RadioItem value="option1" id="h-opt1" />
          <label htmlFor="h-opt1" className="text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option2" id="h-opt2" />
          <label htmlFor="h-opt2" className="text-sm">
            Option 2
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option3" id="h-opt3" />
          <label htmlFor="h-opt3" className="text-sm">
            Option 3
          </label>
        </div>
      </RadioGroup>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Vertical</span>
      <RadioGroup
        defaultValue="option2"
        orientation="vertical"
        className="flex-col"
        aria-label="Vertical options"
      >
        <div className="flex items-center gap-2">
          <RadioItem value="option1" id="v-opt1" />
          <label htmlFor="v-opt1" className="text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option2" id="v-opt2" />
          <label htmlFor="v-opt2" className="text-sm">
            Option 2
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option3" id="v-opt3" />
          <label htmlFor="v-opt3" className="text-sm">
            Option 3
          </label>
        </div>
      </RadioGroup>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Disabled</span>
      <RadioGroup disabled defaultValue="option1" aria-label="Disabled options">
        <div className="flex items-center gap-1">
          <RadioItem value="option1" id="d-opt1" />
          <label htmlFor="d-opt1" className="text-fg-muted text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option2" id="d-opt2" />
          <label htmlFor="d-opt2" className="text-fg-muted text-sm">
            Option 2
          </label>
        </div>
      </RadioGroup>
    </div>
  </div>
);
