import { createClient } from "../utils/supabase/client";

const supabase = createClient();

async function fetchEmojis(): Promise<string[]> {
  let emojisList = [];

  try {
    const humeRows = await supabase.from("hume").select("emotionsJSON");
    const emotionsJSON = humeRows.data[0].emotionsJSON;

    const mappingResponse = await supabase
      .from("emotions")
      .select("emotion, emoji");

    const emojiMapping = mappingResponse.data.reduce((dict, item) => {
      dict[item.emotion] = item.emoji;
      return dict;
    }, {});

    console.log(emojiMapping);

    console.log(emotionsJSON);

    emojisList = Object.keys(emotionsJSON).flatMap((emotion) => {
      const count = emotionsJSON[emotion];
      const emoji = emojiMapping[emotion];
      return Array(count).fill(emoji);
    });

    console.log(emojisList);

  } catch (error) {
    console.error("Error in fetchEmojis:", error);
  }

  return emojisList;
}

export { fetchEmojis };
