import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { fetchEmojis } from "../utils/fetchEmojis";
import { easeOut, motion } from "framer-motion";
import { useWindowSize } from "rooks";
import { v4 as uuidv4 } from "uuid";

const EmojiOverlay = ({ on }: any) => {
  const { innerWidth, innerHeight, outerHeight, outerWidth } = useWindowSize();
  const [emojis, setEmojis] = useState<string[]>([]); // State to hold emojis
  const supabase = createClient();

  useEffect(() => {
    if (!on) {
      return;
    }
    (async () => {
      setEmojis(await fetchEmojis());
    })();

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
            setEmojis(await fetchEmojis());
          })();
        }
      )
      .subscribe();
  }, []);

  return (
    <div className="flex flex-row items-center w-screen">
      {emojis.map((emoji) => (
        <motion.div
          key={uuidv4()}
          initial="initial"
          animate="animate"
          variants={{
            initial: {
              x: Math.random() * innerWidth,
              y: 0,
              opacity: 1,
              z: 10,
            },
            animate: {
              rotate: Math.random() * 80 - 20,
              y: -outerHeight - 100,
              opacity: 0,
            },
          }}
          transition={{ duration: 4 + Math.random() * 5, ease: easeOut }}
          style={{
            position: "absolute",
            bottom: 50,
            fontSize: "4rem",
            zIndex: 10,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default EmojiOverlay;
