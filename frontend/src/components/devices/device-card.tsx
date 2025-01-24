import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Power,
  Signal,
  Wifi,
  ChevronUp,
  ChevronDown,
  Plus,
  Router,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeviceCardProps {
  hardware_name: string;
  friendly_name: string | null;
  room: string | null;
  tag: string | null;
  state: boolean | null;
  last_usage: number;
  onPowerToggle: () => void;
  onUpdate: (updates: {
    friendly_name: string | null;
    tag: string | null;
    room: string | null;
  }) => void;
  uptime: number;
  wifi_rssi: number;
  wifi_signal: number;
  wifi_name: string;
  existingRooms: string[];
  existingTags: string[];
  onSelect?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  hardware_name,
  friendly_name,
  room,
  tag,
  state,
  last_usage,
  onPowerToggle,
  onUpdate,
  uptime,
  wifi_rssi,
  wifi_signal,
  wifi_name,
  existingRooms,
  existingTags,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editName, setEditName] = useState<string | null>(friendly_name);
  const [editTag, setEditTag] = useState<string | null>(tag);
  const [editRoom, setEditRoom] = useState<string | null>(room);
  const [isAddingNewTag, setIsAddingNewTag] = useState(false);
  const [isAddingNewRoom, setIsAddingNewRoom] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [newRoomValue, setNewRoomValue] = useState('');

  const handleSave = () => {
    onUpdate({
      friendly_name: editName,
      tag: editTag,
      room: editRoom,
    });
  };

  const handleAddNewTag = () => {
    const trimmedValue = newTagValue.trim();
    if (trimmedValue) {
      existingTags.push(trimmedValue); // Add to existing tags
      setEditTag(trimmedValue);
      setNewTagValue('');
      setIsAddingNewTag(false);
    }
  };

  const handleAddNewRoom = () => {
    const trimmedValue = newRoomValue.trim();
    if (trimmedValue) {
      existingRooms.push(trimmedValue); // Add to existing rooms
      setEditRoom(trimmedValue);
      setNewRoomValue('');
      setIsAddingNewRoom(false);
    }
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
    if (isInteractiveElement(e.target)) return;
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
      <Card className="relative h-full hover:shadow-lg">
        {!room && !tag && (
          <div className="absolute left-2 top-2 w-20 bg-purple-400 py-0.5 text-center text-[10px] font-medium text-white rounded">
            Click to Set!
          </div>
        )}

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
              variant={
                state === true
                  ? 'default'
                  : state === false
                    ? 'secondary'
                    : 'destructive'
              }
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
                    state === true
                      ? 'default'
                      : state === false
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {state === true
                    ? 'ONLINE'
                    : state === false
                      ? 'IDLE'
                      : 'OFFLINE'}
                </Badge>
                <span className="font-medium">{last_usage}W</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium mb-4">Device Info</h3>
                <div className="grid gap-3 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4" />
                    <span>
                      Uptime: {Math.floor(uptime / 3600)}h{' '}
                      {Math.floor((uptime % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>
                      Signal: {wifi_signal}% ({wifi_rssi}dBm)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Router className="h-4 w-4" />
                    <span>Network: {wifi_name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge
                      variant={
                        state === true
                          ? 'default'
                          : state === false
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {state === true
                        ? 'ONLINE'
                        : state === false
                          ? 'IDLE'
                          : 'OFFLINE'}
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
                      value={editName || ''}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={hardware_name}
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Tag</label>
                    {isAddingNewTag ? (
                      <div className="flex gap-2">
                        <Input
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          placeholder="Enter new tag"
                        />
                        <Button onClick={handleAddNewTag} className="shrink-0">
                          Add
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={editTag || ''}
                          onValueChange={setEditTag}
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
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAddingNewTag(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Room</label>
                    {isAddingNewRoom ? (
                      <div className="flex gap-2">
                        <Input
                          value={newRoomValue}
                          onChange={(e) => setNewRoomValue(e.target.value)}
                          placeholder="Enter new room"
                        />
                        <Button onClick={handleAddNewRoom} className="shrink-0">
                          Add
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={editRoom || ''}
                          onValueChange={setEditRoom}
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
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAddingNewRoom(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

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
