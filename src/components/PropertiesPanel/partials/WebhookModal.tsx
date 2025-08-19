import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import KeyValueEditor, { KV } from '@/components/KeyValueEditor/KeyValueEditor';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';

type WebhookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
};

export default function WebhookModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: WebhookModalProps) {
  const [method, setMethod] = useState(initialData?.method || 'GET');
  const [url, setUrl] = useState(initialData?.url || 'https://');
  const [showHeaders, setShowHeaders] = useState(!!initialData?.headers?.length);
  const [headers, setHeaders] = useState<KV[]>(initialData?.headers || []);
  const [showBody, setShowBody] = useState(!!initialData?.body);
  const [body, setBody] = useState(initialData?.body || '');
  const [showTest, setShowTest] = useState(false);
  const [testVars, setTestVars] = useState<KV[]>([]);


  const handleSave = () => {
    const dataToSave = {
      method,
      url,
      headers: showHeaders ? headers : [],
      body: showBody ? body : '',
    };
    onSave(dataToSave);
    onClose();
  };

  const handleInsertVariable = (name: string) => {
    setUrl((prev: string) => `${prev}{{${name}}}`);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Webhook</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="space-y-2">
                <Label>URL & Method</Label>
                <div className="flex gap-2">
                    <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative w-full">
                        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://" className="pr-24" />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2">
                           <VariableChipAutocomplete variables={['name', 'email', 'cart_item', 'order_id']} onInsert={handleInsertVariable} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Customize Headers</Label>
                        <p className="text-xs text-muted-foreground">Add headers to your request (example: Content-Type: application/json)</p>
                    </div>
                    <Switch checked={showHeaders} onCheckedChange={setShowHeaders} />
                </div>
                {showHeaders && <KeyValueEditor items={headers} onChange={setHeaders} />}
                 <p className="text-xs text-muted-foreground">User-Agent is not sent as a header by default. make sure you include it if necessary.</p>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Customize Body</Label>
                    <Switch checked={showBody} onCheckedChange={setShowBody} />
                </div>
                 {showBody && <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder='{ "key": "value" }' rows={5} />}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                     <div>
                        <Label>Test Your Request</Label>
                        <p className="text-xs text-muted-foreground">Manually set values for test variables</p>
                    </div>
                    <Switch checked={showTest} onCheckedChange={setShowTest} />
                </div>
                {showTest && <KeyValueEditor items={testVars} onChange={setTestVars} placeholderKey="variable" placeholderValue="test value" />}
                <p className="text-xs text-muted-foreground">If your request contains variables, you can manually set their values for testing purposes.</p>
            </div>


        </div>
        <DialogFooter className="justify-between">
            <Button variant="secondary" onClick={() => alert('Test request sent!')}>Test the request</Button>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
