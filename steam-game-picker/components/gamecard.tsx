import Image from "next/image";

const GameCard = ({ game }: { game: { appid: number; name: string } }) => {
    return (
        <div className="rounded shadow-md p-4 bg-white">
          <Image
            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
            alt={game.name}
            width={460}
            height={215}
            className="rounded"
          />
          <h3 className="mt-2 font-bold text-lg">{game.name}</h3>
        </div>
      );
}

export default GameCard;