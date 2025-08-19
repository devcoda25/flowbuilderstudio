import { Button } from './ui/button';

export default function UpdateToast({ onReload }: { onReload: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="pr-4">
        <p className="font-semibold">New version available</p>
        <p className="text-sm text-muted-foreground">Please reload to apply the update.</p>
      </div>
      <Button onClick={onReload}>Reload</Button>
    </div>
  )
}
