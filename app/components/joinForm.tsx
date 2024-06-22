"use client";

import Image from "next/image";
import { Input, Stack, Button } from "@chakra-ui/react";
import { join } from "path";
import { useState } from "react";

export default function JoinForm() {
  const [roomName, setRoomName] = useState("");

  function joinRoom() {}

  return (
    <Stack spacing={3}>
      <Input
        placeholder="Enter room name"
        bg="transparent"
        color="white"
        value={roomName}
      />
      <Input placeholder="Enter username" bg="transparent" color="white" />
      <Button onClick={joinRoom}>Submit</Button>
    </Stack>
  );
}
