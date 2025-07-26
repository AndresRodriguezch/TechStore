import Image from "next/image";
import { products } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Productos Destacados</h1>
        <p className="text-muted-foreground mt-2">
          Explora nuestra selección de los mejores productos tecnológicos.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                data-ai-hint="product image"
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold mb-2">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
               <div className="flex justify-between items-center w-full">
                <p className="text-2xl font-bold">
                  ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Button className="w-full">Añadir al Carrito</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
