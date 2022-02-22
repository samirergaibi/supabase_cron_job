import { schedule } from "@netlify/functions";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

type ChuckNorrisResp = {
  value?: string;
};

const addJokeToDB = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLIC_KEY
  );

  try {
    const resp = await fetch("https://api.chucknorris.io/jokes/random");
    const { value: joke }: ChuckNorrisResp = await resp.json();

    const { data, error } = await supabase
      .from("keep_alive")
      .insert([{ joke }]);

    if (error) {
      throw new Error(error.message);
    }

    console.log("Joke was successfully added to table!", data);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export const handler = schedule("@daily", addJokeToDB);
