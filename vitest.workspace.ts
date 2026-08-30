export default [
    {
        test: {
            name: "@ros/commons",
            root: "packages/commons",
            environment: "node",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/db",
            root: "packages/db",
            environment: "node",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/ui",
            root: "packages/ui",
            environment: "jsdom",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/admin-api",
            root: "apps/admin-api",
            environment: "node",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/vendor-api",
            root: "apps/vendor-api",
            environment: "node",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/mandi-api",
            root: "apps/mandi-api",
            environment: "node",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/admin",
            root: "apps/admin",
            environment: "jsdom",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/vendor",
            root: "apps/vendor",
            environment: "jsdom",
            globals: true,
            passWithNoTests: true,
        },
    },
    {
        test: {
            name: "@ros/mandi",
            root: "apps/mandi",
            environment: "jsdom",
            globals: true,
            passWithNoTests: true,
        },
    },
]
