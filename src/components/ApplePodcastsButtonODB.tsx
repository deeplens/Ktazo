
import Image from "next/image";
import Link from "next/link";

const ODB_APPLE_URL =
  "https://podcasts.apple.com/us/podcast/our-daily-bread-podcast/id383323406";

export default function ApplePodcastsButtonODB() {
  return (
    <Link
      href={ODB_APPLE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Listen to Our Daily Bread on Apple Podcasts"
    >
      <Image
        src="/badges/listen-on-apple-podcasts.svg"
        alt="Listen on Apple Podcasts"
        width={165}
        height={40}
        priority
      />
    </Link>
  );
}
