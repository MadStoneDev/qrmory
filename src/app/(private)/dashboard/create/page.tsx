import QRCreator from "@/components/qr-create/qr-creator";

export default function Create() {
  return (
    <section className={`flex flex-col overflow-y-auto`}>
      <h1 className={`mb-4 text-xl font-bold`}>Create</h1>
      <QRCreator withHeading={false} />
    </section>
  );
}
