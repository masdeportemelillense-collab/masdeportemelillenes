import { createRouter, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function NotFoundComponent() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-display text-5xl leading-none">No encontrado</h1>
      <p className="mt-3 text-sm text-muted">Esa página no está en Melilla Directo.</p>
      <Link to="/" className="mt-6 inline-block text-sm text-accent hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
  });
}
