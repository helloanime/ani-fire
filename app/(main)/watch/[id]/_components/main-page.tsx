"use client";

import AnimeInfo from "@/components/anime-info";
import Episodes from "@/components/shared/episodes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IoPlayBackSharp, IoPlayForwardSharp } from "react-icons/io5";
import {
  useGetAnimeEpisodeServer,
  useGetAnimeEpisodes,
  useGetAnimeInfo,
} from "@/lib/query-api";
import Link from "next/link";
import FirePlayer from "@/components/players/fire-player";
import AnimeCard from "@/components/shared/anime-card";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategory, setServer } from "@/redux/utilities";
import { RootState } from "@/redux/store";

type MainPageProps = {
  params: string;
  query: string;
  episodeNumber: string;
};

const MainPage = ({ params, query, episodeNumber }: MainPageProps) => {
  // Tanstack queries;
  const { data, isLoading, isError } = useGetAnimeEpisodeServer(query);
  const { data: episodes, isLoading: isEpisodeLoading } =
    useGetAnimeEpisodes(params);
  const { data: animeInfo, isLoading: isInfoLoading } = useGetAnimeInfo(params);

  // Hooks
  const { setAnimeWatch } = useLocalStorage();
  const dispatch = useDispatch();
  const { category, server } = useSelector(
    (state: RootState) => state.selectUtility
  );

  // effects
  useEffect(() => {
    if (data && data.sub && data.sub.length > 0) {
      dispatch(setServer(data.sub[0].serverName));
    } else if (data && data.raw && data.raw.length > 0) {
      dispatch(setServer(data.raw[0].serverName));
    }
  }, [data, dispatch]);

  // Minimal States
  const description = animeInfo?.anime.info.description;

  // Functions
  const handleClick = (serverName: string, category: string) => {
    dispatch(setServer(serverName));
    dispatch(setCategory(category));
  };

  const isCurrentEpisode = episodes?.episodes.filter(
    (episode) => episode.episodeId === query
  );

  const currentEpisodeIndex = episodes?.episodes.findIndex(
    (ep) => ep.episodeId === query
  );

  const isNextEpisode =
    Number(currentEpisodeIndex) + 1 !== episodes?.totalEpisodes;
  const isPrevEpisode = Number(currentEpisodeIndex) + 1 !== 1;

  const nextEpisode =
    isNextEpisode &&
    episodes?.episodes[Number(currentEpisodeIndex) + 1].episodeId;
  const prevEpisode =
    isPrevEpisode &&
    episodes?.episodes[Number(currentEpisodeIndex) - 1].episodeId;

  useEffect(() => {
    if (animeInfo && episodes) {
      setAnimeWatch({
        episodeId: query,
        episodeNumber: currentEpisodeIndex! + 1,
        poster: animeInfo?.anime.info.poster,
        title: animeInfo?.anime.info.name,
      });
    }
  });

  const handlePrev = () => {
    return window.location.assign(`/watch/${prevEpisode}`);
  };

  const handleNext = () => {
    return window.location.assign(`/watch/${nextEpisode}`);
  };

  if (isEpisodeLoading) return <p>Loading episodes...</p>;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error</p>;
  return (
    <section className="relative w-full h-auto">
      {/* Flow Tree */}
      <div className="flex text-sm my-4 2xl:max-w-screen-2xl mx-auto gap-x-1 items-center px-4">
        {/* TODO: make it working as link element */}
        <Link
          href="/home"
          title="Home"
          className="hover:text-rose-600 text-secondary-foreground dark:text-primary-foreground"
        >
          Home
        </Link>
        <span className="h-1 w-1 flex rounded-full bg-muted-foreground mx-2"></span>
        <a
          href="/anime/tv"
          title="TV"
          className="hover:text-rose-600 text-secondary-foreground dark:text-primary-foreground"
        >
          TV
        </a>
        <span className="h-1 w-1 flex rounded-full bg-muted-foreground mx-2"></span>

        {/* TODO: To fix the episode code here */}
        <a href={`/${animeInfo?.anime.info.id}`} className="">
          {animeInfo?.anime.info.name}
        </a>
      </div>

      {/* main episodes no. and video player here! */}
      <div className="2xl:max-w-screen-2xl lg:max-w-10xl px-4 mx-auto w-full flex 2xl:flex-row flex-col h-auto">
        {isEpisodeLoading && !episodes ? (
          <p>Loading...</p>
        ) : (
          <Episodes
            screen="PC"
            query={query}
            episodes={episodes?.episodes!}
            moreEpisodes={episodes?.totalEpisodes!}
          />
        )}

        {/* Video player --> */}
        <div className="w-full h-full">
          {isLoading && !episodeNumber ? (
            <div className="h-64 w-full bg-black"></div>
          ) : (
            <FirePlayer
              poster={animeInfo?.anime.info.poster!}
              episodeId={data?.episodeId!}
            />
          )}

          <div className="w-full 2xl:max-w-screen-2xl lg:max-w-10xl gap-x-2 py-4 h-auto flex justify-end items-center">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={handlePrev}
              disabled={!isPrevEpisode}
            >
              <IoPlayBackSharp className="h-4 w-4 mr-2" /> Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={handleNext}
              disabled={!isNextEpisode}
            >
              Next <IoPlayForwardSharp className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="flex 2xl:flex-row flex-col gap-x-4 py-3">
            <div className="2xl:w-1/2 w-full flex flex-col bg-primary p-3 items-center justify-center text-center">
              <p className="text-sm text-white inline">
                You are watching{" "}
                <span className="font-semibold">
                  Episode {!!isCurrentEpisode && isCurrentEpisode[0].number}
                </span>{" "}
                If current server doesnt work please try other servers beside.
              </p>
            </div>
            <div className="2xl:mt-0 mt-4">
              <div className="flex items-center gap-x-4 mb-4">
                <p className="text-sm">Sub: </p>
                <div className="flex gap-4 flex-wrap">
                  {data?.sub.map((server) => (
                    <Button
                      size="sm"
                      variant={category === "sub" ? "default" : "outline"}
                      onClick={() => handleClick(server.serverName, "sub")}
                      key={server.serverName}
                    >
                      {server.serverName}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="w-full" />

              {/* Dub */}
              {!!data && data?.dub.length > 0 && (
                <div className="flex gap-x-4 mt-4 items-center">
                  <p className="text-sm">Dub:</p>
                  <div className="flex gap-4 flex-wrap">
                    {data?.dub.map((server) => (
                      <Button
                        size="sm"
                        variant={category === "dub" ? "default" : "outline"}
                        onClick={() => handleClick(server.serverName, "dub")}
                        key={server.serverName}
                      >
                        {server.serverName}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes numbers for mobile 📱 */}
        <Episodes
          screen="Mobile"
          query={query}
          episodes={episodes?.episodes!}
          moreEpisodes={episodes?.totalEpisodes!}
        />

        {/* TODO: add a brief info of the anime */}
        <aside className="2xl:block h-auto 2xl:max-w-[23rem] w-full flex gap-x-4">
          {isInfoLoading && !animeInfo ? (
            <p>Loading Anime info.</p>
          ) : (
            <AnimeInfo
              page="Watching"
              description={description}
              data={animeInfo!}
            />
          )}
        </aside>
      </div>

      <div className="2xl:max-w-screen-2xl mx-auto px-4 w-full h-auto">
        <h3 className="text-2xl text-white font-bold">Related Anime</h3>

        <div className="grid xl:grid-cols-8 lg:grid-cols-7 sm:grid-cols-6 xs:grid-cols-5 grid-cols-3 my-6 gap-4 w-full text-[10px]">
          {animeInfo?.relatedAnimes.map((anime, index) => (
            <AnimeCard type="Normal" anime={anime} key={anime.id + index} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default MainPage;
