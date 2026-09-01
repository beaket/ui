import { Alert } from "../../components/alert";

export default () => (
  <div className="max-w-lg space-y-6">
    <div>
      <h3 className="mb-4 text-sm font-medium">All Variants</h3>
      <div className="space-y-3">
        <Alert variant="note">Note: General information.</Alert>
        <Alert variant="tip">Tip: Helpful suggestion.</Alert>
        <Alert variant="important">Important: Key information.</Alert>
        <Alert variant="warning">Warning: Be careful.</Alert>
        <Alert variant="caution">Caution: Dangerous action.</Alert>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Custom Titles</h3>
      <div className="space-y-3">
        <Alert variant="note" title="Did you know?">
          Custom titles can make alerts more contextual.
        </Alert>
        <Alert variant="warning" title="Before you proceed">
          Make sure you have saved your work.
        </Alert>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Rich Content</h3>
      <Alert variant="important">
        <p>You can include multiple paragraphs in an alert.</p>
        <p className="mt-2">This allows for more detailed explanations when needed.</p>
      </Alert>
    </div>
  </div>
);
