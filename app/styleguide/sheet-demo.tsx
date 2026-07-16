"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Petit îlot client : le Sheet (Radix Dialog) doit vivre dans un Client Component.
// La page /styleguide reste un Server Component et intègre cette démo.
export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ouvrir le menu (Sheet)</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation mobile</SheetTitle>
          <SheetDescription>
            Exemple de tiroir latéral (composant « sheet ») destiné à la
            navigation mobile des futures pages publiques.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <Button variant="ghost" className="justify-start">
            Accueil
          </Button>
          <Button variant="ghost" className="justify-start">
            Parler à quelqu&apos;un
          </Button>
          <Button variant="ghost" className="justify-start">
            Informations
          </Button>
        </nav>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Fermer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
