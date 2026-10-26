import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CategoriesRedirectPage() {
  redirect('/?category=all#products');
}
