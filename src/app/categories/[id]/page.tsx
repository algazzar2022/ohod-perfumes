import { redirect } from 'next/navigation';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?category=${id}`);
}
