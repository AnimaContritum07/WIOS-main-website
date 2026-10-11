// Intentionally blank starter file. Add implementation here.
type EventPageProps = {
  params: Promise<{
    eventName: string;
  }>;
};

export default async function EventPage({
  params,
}: EventPageProps) {
  const { eventName } = await params;

  const formattedEventName = decodeURIComponent(eventName)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <main>
      <h1>{formattedEventName}</h1>
      <p>placeholder</p>
    </main>
  );
}