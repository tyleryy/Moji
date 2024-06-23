"use client";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "../../utils/supabase/client";
import { useScreenshot } from "use-react-screenshot";
import EmojiOverlay from "../../components/emojiOverlay";

export default function Page({ params }: { params: { creds: string[] } }) {
  const room = params.creds[0];
  const isHost = params.creds[2] === "host";
  const name = isHost ? "(Host) " + params.creds[1] : params.creds[1];

  const memoizedEmojiOverlay = useMemo(() => <EmojiOverlay />, []);

  const [token, setToken] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const [image, takeScreenShot] = useScreenshot();
  const [file, setFile] = useState<File | null>(null);

  const supabase = createClient();

  const imageToFile = async (imageUrl: string) => {
    const filename = new Date().toISOString() + '.png';
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/png' });
  };

  const uploadFileToSupabase = async (file: File) => {
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(file.name, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
    } else {
      console.log('File uploaded successfully:', data);
    }
  };

  const captureAndUploadImage = async () => {
    if (ref.current) {
      const screenshot = await takeScreenShot(ref.current);
      const file = await imageToFile(screenshot);
      console.log("Captured file:", file);
      setFile(file);
      await uploadFileToSupabase(file);
    } else {
      console.error("The ref is not correctly set.");
    }
  };

  useEffect(() => {
    if (isHost) {
      const intervalId = setInterval(() => {
        captureAndUploadImage();
      }, 10000); // 10 seconds interval

      return () => clearInterval(intervalId); // Cleanup the interval on component unmount
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <>
    {memoizedEmojiOverlay}
      <div ref={ref}>
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          // Use the default LiveKit theme for nice styles.
          data-lk-theme="default"
          style={{ height: "100dvh" }}
        >
          {/* Your custom component with basic video conferencing functionality. */}
          <MyVideoConference />
          {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
          <RoomAudioRenderer />
          {/* Controls for the user to start/stop audio, video, and screen
      share tracks and to leave the room. */}
          <ControlBar />
        </LiveKitRoom>
      </div>
    </>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}
