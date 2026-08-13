export const customFetch: typeof fetch = async (url, options) => {
    let response = await fetch(url, {
        ...options,
        credentials: "include",
    })

    const urlString =
        typeof url === "string" ? url : url instanceof URL ? url.toString() : (url as Request).url

    if (response.status === 401 && !urlString.includes("auth.refresh")) {
        const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/trpc/auth.refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
            credentials: "include",
        })

        if (refreshResponse.ok) {
            response = await fetch(url, {
                ...options,
                credentials: "include",
            })
        }
    }

    return response
}
