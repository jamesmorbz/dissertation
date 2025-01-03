import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Power, Signal, Wifi, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Device } from '@/types/device';

interface DeviceCardProps
  extends Pick<
    Device,
    'hardware_name' | 'friendly_name' | 'room' | 'tag' | 'power'
  > {
  last_usage: number;
  onPowerToggle: () => void;
  onUpdate: (
    updates: Partial<{
      friendly_name: string | null;
      tag: string;
      room: string;
    }>,
  ) => void;
  uptime?: number;
  wifi_rssi?: number;
  wifiSignal?: number;
  wifi_name?: string;
  existingRooms: string[];
  existingTags: string[];
  onSelect?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  hardware_name,
  friendly_name,
  room,
  tag,
  power,
  last_usage,
  onPowerToggle,
  onUpdate,
  uptime = 0,
  wifi_rssi = -70,
  wifiSignal = 60,
  wifi_name = 'WiFi',
  existingRooms,
  existingTags,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editName, setEditName] = useState(friendly_name || '');
  const [editTag, setEditTag] = useState<string | null>(tag);
  const [editRoom, setEditRoom] = useState(room);
  const [newTag, setNewTag] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [isAddingNewTag, setIsAddingNewTag] = useState(false);
  const [isAddingNewRoom, setIsAddingNewRoom] = useState(false);

  const handleSave = () => {
    onUpdate({
      friendly_name: editName || null,
      tag: editTag || '',
      room: editRoom,
    });
  };

  const INTERACTIVE_ELEMENTS = ['button', 'input', 'select'] as const;

  const isInteractiveElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }

    return INTERACTIVE_ELEMENTS.some(
      (element) =>
        target.tagName.toLowerCase() === element ||
        target.closest(element) !== null,
    );
  };

  const handleCardClickExclusive = (e: React.MouseEvent) => {
    if (isInteractiveElement(e.target)) {
      return;
    }
    handleCardClick();
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    onSelect?.();
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isExpanded ? 'col-span-full row-span-2' : ''
      }`}
      onClick={handleCardClickExclusive}
    >
      <Card className="h-full hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            {friendly_name || hardware_name}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCardClick()}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={power ? 'default' : 'secondary'}
              size="icon"
              onClick={onPowerToggle}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isExpanded ? (
            <div className="grid gap-2">
              <div className="text-sm text-gray-500 text-left">
                {tag ? tag : 'NOT SET'} &middot; {room ? room : 'NOT SET'}
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    power === true
                      ? 'default'
                      : power === false
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {power === true
                    ? 'ONLINE'
                    : power === false
                      ? 'IDLE'
                      : 'OFFLINE'}
                </Badge>
                <span className="font-medium">{last_usage}W</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3 className="font-medium mb-4">Device Status</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    {tag} &middot; {room}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={power ? 'default' : 'destructive'}>
                      {power ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                    <span className="font-medium">{last_usage}W</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-4">Settings</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label>Friendly Name</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={hardware_name}
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Tag</label>
                    {isAddingNewTag ? (
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="New tag"
                        />
                        <Button
                          onClick={() => {
                            setEditTag(newTag);
                            setIsAddingNewTag(false);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={editTag || ''}
                        onValueChange={(value) => {
                          if (value === 'add_new') setIsAddingNewTag(true);
                          else setEditTag(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                          <SelectItem value="add_new">+ Add new tag</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Room</label>
                    {isAddingNewRoom ? (
                      <div className="flex gap-2">
                        <Input
                          value={newRoom}
                          onChange={(e) => setNewRoom(e.target.value)}
                          placeholder="New room"
                        />
                        <Button
                          onClick={() => {
                            setEditRoom(newRoom);
                            setIsAddingNewRoom(false);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={editRoom}
                        onValueChange={(value) => {
                          if (value === 'add_new') setIsAddingNewRoom(true);
                          else setEditRoom(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingRooms.map((room) => (
                            <SelectItem key={room} value={room}>
                              {room}
                            </SelectItem>
                          ))}
                          <SelectItem value="add_new">
                            + Add new room
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-4">Device Info</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4" />
                    <span>
                      Uptime: {Math.floor(uptime / 3600)}h{' '}
                      {Math.floor((uptime % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>Signal: {wifiSignal}%</span>
                  </div>
                  <div>RSSI: {wifi_rssi}dBm</div>
                  <div>Network: {wifi_name}</div>
                  <Button onClick={handleSave} className="mt-4">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
