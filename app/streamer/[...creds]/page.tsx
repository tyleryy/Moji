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
import { useEffect, useState } from "react";
import { fetchEmojis } from "../../utils/fetchEmojis";
import { createClient } from "../../utils/supabase/client";

export default function Page({ params }: { params: { creds: string[] } }) {
  // TODO: get user input for room and name
  const room = "stream-room";
  const name = "(host) " + params.creds[1];
  const [token, setToken] = useState("");
  const [emojis, setEmojis] = useState<string[]>([]); // State to hold emojis

  const supabase = createClient();

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
    if (token !== "") {
      (async () => {
        const emojis = await fetchEmojis();
        setEmojis(emojis);
      })();
    }
    const channelA = supabase
      .channel("emoji_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hume",
        },
        (payload: any) => {
          console.log("Received payload", payload.new.emotionsJSON);

          (async () => {
            const emojisList: string[] = [];

            for (const [emotion, count] of Object.entries(
              payload.new.emotionsJSON
            )) {
              const countAsNumber = Number(count);
              console.log(
                `Fetching emojis for emotion '${emotion}' with count ${countAsNumber}`
              );

              // Fetch emojis associated with the current emotion from Supabase
              const { data: emojiData, error: emojiError } = await supabase
                .from("emotions")
                .select("emoji")
                .eq("emotion", emotion)
                .limit(countAsNumber);

              if (emojiError) {
                console.error(
                  `Error fetching emojis for emotion '${emotion}':`,
                  emojiError
                );
                continue;
              }

              if (emojiData) {
                // Replicate each emoji based on its count
                for (const emojiItem of emojiData) {
                  for (let i = 0; i < countAsNumber; i++) {
                    emojisList.push(emojiItem.emoji);
                  }
                }
              }
            }
            setEmojis(emojisList);
          })();
        }
      )
      .subscribe();

    // return () => {
    //   supabase.removeAllChannels();
    // };
  }, [token, supabase]);

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <>
      {emojis ?? <div>Emojis: {emojis.join(" ")}</div>}

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
