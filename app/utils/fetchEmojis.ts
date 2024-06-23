import { createClient } from "../utils/supabase/client";

const supabase = createClient();

async function fetchEmojis(): Promise<string[]> {
  let emojis: string[] = [];

  try {
    // Fetch data from the "hume" table, specifically the "emotionsJSON" column
    const { data, error } = await supabase
    .from('hume')
    .select('emotionsJSON');

    if (error) {
      console.error('Error fetching data from "hume" table:', error);
      return [];
    }

    console.log('Fetched data from "hume" table:', data);

    if (data) {
      for (const row of data) {
        try {
          console.log('Starting to fetch data from "emotions" table');
          const emotionsMap = typeof row.emotionsJSON === 'object'
          ? row.emotionsJSON  // Use as-is if already an object
          : JSON.parse(row.emotionsJSON);  // Parse if it's a JSON string

        console.log('Parsed emotionsJSON:', emotionsMap);

          for (const [emotion, count] of Object.entries(emotionsMap)) {
            const countAsNumber = Number(count);
            console.log(`Fetching emojis for emotion '${emotion}' with count ${countAsNumber}`);


            // Fetch emojis associated with the current emotion from Supabase
            const { data: emojiData, error: emojiError } = await supabase
              .from('emotions')
              .select('emoji')
              .eq('emotion', emotion)
              .limit(countAsNumber);



            if (emojiError) {
              console.error(`Error fetching emojis for emotion '${emotion}':`, emojiError);
              continue;
            }

            if (emojiData) {
              // Replicate each emoji based on its count
              for (const emojiItem of emojiData) {
                for (let i = 0; i < countAsNumber; i++) {
                  emojis.push(emojiItem.emoji);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing emotionsJSON:', error);
        }
      }
    }

    console.log('Fetched Emojis:', emojis.join(' '));
  } catch (error) {
    console.error('Error in fetchEmojis:', error);
  }

  return emojis;
}

export { fetchEmojis };






