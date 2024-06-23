"use server";

import { EgressClient, EncodedFileOutput, ImageOutput, S3Upload } from "livekit-server-sdk";
// import { getSelf } from "@/lib/auth-service";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";


export const createEgress = async () => {
    // const self = await getSelf();
    
    const egressClient = new EgressClient(
        wsUrl, apiKey, apiSecret
    );
    
    console.log("egressclient has been created");
    
    // const imageOutput = new ImageOutput({
    //     captureInterval: 10,
    //     filenamePrefix: 'livekit-demo/room-composite-test-',
    //     width: 640,
    //     height: 480,
    //     output: {
    //         case: 's3',
        //     value: new S3Upload({
        //       accessKey: process.env.SUPABASE_ACCESS_KEY,
        //       secret:    process.env.SUPABASE_SECRET,
        //       region:    process.env.SUPABASE_REGION,
        //       bucket:    'images'
        //   }),
    //     },
    //   });

    const fileOutput = new EncodedFileOutput({
        filepath: 'livekit-demo/room-composite-test.jpeg',
        output: {
            case: 's3',
            value: new S3Upload({
                accessKey: process.env.SUPABASE_ACCESS_KEY,
                secret:    process.env.SUPABASE_SECRET,
                region:    process.env.SUPABASE_REGION,
                endpoint:  process.env.SUPABASE_ENDPOINT,
                bucket:   'images'
            }),
        }
    });
  
    console.log('about to start room composite egress');
    console.log(egressClient);
  
    //   const info = await egressClient.startRoomCompositeEgress('room', {images: imageOutput}).then(() => {console.log("egress is done!")});
    const info = await egressClient.startRoomCompositeEgress('room', fileOutput).then(() => {console.log("egress is done!")});

};


