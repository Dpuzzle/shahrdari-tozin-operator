import { midFetcher } from "@/lib/axios";
import { useEffect, useState } from "react";

export const useMid = () => {
  const [baskolData, setBaskolData] = useState<
    | {
        plaque_number: string;
        baskol_number: 1 | 2 | 3;
        baskol_value: number;
        image_link: string;
      }
    | undefined
  >();

  const fetchMidData = async () => {
    const response = await midFetcher.get("/");

    setBaskolData(response.data);
  };

  // useEffect(() => {
  //   fetchMidData();
  // }, []);

  return { fetchMidData, baskolData };
};
