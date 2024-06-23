"use client";

import Image from "next/image";
import {
  Input,
  Stack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Switch,
} from "@chakra-ui/react";

import { useState } from "react";

import { useRouter } from "next/navigation";

export default function JoinForm() {
  const [roomName, setRoomName] = useState<any>("");
  const [userName, setUserName] = useState<any>("");
  const router = useRouter();
  function joinRoom() {
    console.log("Joining room", roomName, userName);
    router.push(`/room/${roomName}/${userName}`);
  }

  return (
    <FormControl>
      <FormLabel>Room Name</FormLabel>
      <Input
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <FormLabel>User Name</FormLabel>
      <Input
        placeholder="Enter username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Button onClick={joinRoom}>Submit</Button>
      <Stack direction={"row"} margin={3}>
        <FormLabel>Host</FormLabel>
        <Switch />
        <FormLabel>Viewer</FormLabel>
      </Stack>
    </FormControl>
  );
}
