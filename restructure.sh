#!/bin/bash

# Create necessary directories
mkdir -p 'src/routes/(auth)/login' 'src/routes/(auth)/register'

# Move login files
mv 'src/routes/login/+page.svelte' 'src/routes/(auth)/login/'
mv 'src/routes/login/+page.server.ts' 'src/routes/(auth)/login/'

# Move registration files
mv 'src/routes/registro/+page.svelte' 'src/routes/(auth)/register/'

# Create +page.server.ts for registration if it doesn't exist
if [ ! -f 'src/routes/(auth)/register/+page.server.ts' ]; then
    echo '// Registration server logic here' > 'src/routes/(auth)/register/+page.server.ts'
fi

# Create logout endpoint
mkdir -p 'src/routes/logout'
echo 'import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
    cookies.delete("session", { path: "/" });
    throw redirect(303, "/login");
};' > 'src/routes/logout/+server.ts'

# Create layout.server.ts
echo 'import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user || null
    };
};' > 'src/routes/+layout.server.ts'

echo "Restructuring complete. Don't forget to update your route references!"
