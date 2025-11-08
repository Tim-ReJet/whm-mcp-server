/**
 * Example Test File
 * Demonstrates testing patterns and best practices for the ReactorJet Stack
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  wait,
  waitFor,
  createMockPost,
  createMockPage,
  createMockACF,
  mockGraphQLFetch,
  resetFetchMock,
  fixtures,
  normalizeHTML,
} from "./setup";

// ============================================
// Basic Unit Tests
// ============================================

describe("Basic Testing Examples", () => {
  it("should perform basic assertions", () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
    expect("hello").toContain("ell");
  });

  it("should test arrays and objects", () => {
    const array = [1, 2, 3];
    expect(array).toHaveLength(3);
    expect(array).toContain(2);

    const obj = { name: "Test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj).toMatchObject({ name: "Test" });
  });

  it("should test async functions", async () => {
    const asyncFn = async () => "result";
    const result = await asyncFn();
    expect(result).toBe("result");
  });

  it("should test promises", () => {
    const promise = Promise.resolve("resolved");
    return expect(promise).resolves.toBe("resolved");
  });
});

// ============================================
// Testing Utilities Examples
// ============================================

describe("Testing Utilities", () => {
  it("should wait for specified time", async () => {
    const start = Date.now();
    await wait(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  it("should wait for condition to be true", async () => {
    let counter = 0;
    const increment = setInterval(() => counter++, 50);

    await waitFor(() => counter >= 5);
    clearInterval(increment);

    expect(counter).toBeGreaterThanOrEqual(5);
  });

  it("should timeout if condition is never met", async () => {
    await expect(waitFor(() => false, 100)).rejects.toThrow(
      "Timeout waiting for condition",
    );
  });
});

// ============================================
// WordPress Data Mocking
// ============================================

describe("WordPress Mock Data", () => {
  it("should create mock post with defaults", () => {
    const post = createMockPost();

    expect(post).toHaveProperty("id");
    expect(post).toHaveProperty("title");
    expect(post).toHaveProperty("content");
    expect(post.author).toHaveProperty("name");
  });

  it("should create mock post with overrides", () => {
    const post = createMockPost({
      title: "Custom Title",
      slug: "custom-slug",
    });

    expect(post.title).toBe("Custom Title");
    expect(post.slug).toBe("custom-slug");
  });

  it("should create mock page", () => {
    const page = createMockPage({
      title: "About Us",
      slug: "about",
    });

    expect(page.title).toBe("About Us");
    expect(page.slug).toBe("about");
  });

  it("should create mock ACF fields", () => {
    const acf = createMockACF({
      heroTitle: "Welcome",
      heroSubtitle: "To our site",
    }) as any;

    expect(acf.fieldGroupName).toBe("testFields");
    expect(acf.heroTitle).toBe("Welcome");
  });

  it("should use fixtures for common data", () => {
    const publishedPost = fixtures.posts.published;
    expect(publishedPost.status).toBe("publish");

    const draftPost = fixtures.posts.draft;
    expect(draftPost.status).toBe("draft");

    const homePage = fixtures.pages.home;
    expect(homePage.slug).toBe("home");
  });
});

// ============================================
// GraphQL Fetch Mocking
// ============================================

describe("GraphQL Mocking", () => {
  afterEach(() => {
    resetFetchMock();
  });

  it("should mock successful GraphQL response", async () => {
    const mockData = {
      posts: {
        nodes: [createMockPost()],
      },
    };

    mockGraphQLFetch(mockData);

    const response = await fetch("https://example.com/graphql", {
      method: "POST",
      body: JSON.stringify({ query: "{ posts { nodes { id } } }" }),
    });

    const result = await response.json();
    expect(result.data).toEqual(mockData);
    expect(result.errors).toBeUndefined();
  });

  it("should mock GraphQL error response", async () => {
    const mockError = {
      message: "Field not found",
      locations: [{ line: 2, column: 5 }],
    };

    mockGraphQLFetch(null, [mockError]);

    const response = await fetch("https://example.com/graphql");
    const result = await response.json();

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe("Field not found");
  });
});

// ============================================
// Testing Functions/Utilities
// ============================================

describe("Utility Functions", () => {
  // Example: Testing a slug generator
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  it("should generate slug from title", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
    expect(generateSlug("Test Title 123")).toBe("test-title-123");
    expect(generateSlug("Special @#$ Characters!")).toBe("special-characters");
  });

  // Example: Testing a date formatter
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  it("should format date correctly", () => {
    const formatted = formatDate("2024-01-15T00:00:00");
    expect(formatted).toBe("January 15, 2024");
  });

  // Example: Testing excerpt generator
  const generateExcerpt = (content: string, maxLength = 100): string => {
    const stripped = content.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + "...";
  };

  it("should generate excerpt from HTML content", () => {
    const html =
      "<p>This is a long piece of content that should be truncated</p>";
    const excerpt = generateExcerpt(html, 20);
    expect(excerpt).toBe("This is a long piece...");
  });

  it("should not truncate short content", () => {
    const short = "<p>Short</p>";
    const excerpt = generateExcerpt(short, 100);
    expect(excerpt).toBe("Short");
  });
});

// ============================================
// Testing with Mocks and Spies
// ============================================

describe("Mocks and Spies", () => {
  it("should spy on function calls", () => {
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };

    logger.log("test message");
    logger.error("error message");

    expect(logger.log).toHaveBeenCalledWith("test message");
    expect(logger.error).toHaveBeenCalledWith("error message");
    expect(logger.log).toHaveBeenCalledTimes(1);
  });

  it("should mock function implementations", () => {
    const mockFn = vi.fn((x: number) => x * 2);

    const result = mockFn(5);
    expect(result).toBe(10);
    expect(mockFn).toHaveBeenCalledWith(5);
  });

  it("should mock modules", () => {
    // Example of mocking an import
    const mockModule = {
      fetchPosts: vi.fn().mockResolvedValue([createMockPost()]),
    };

    return expect(mockModule.fetchPosts()).resolves.toHaveLength(1);
  });
});

// ============================================
// Testing with beforeEach/afterEach
// ============================================

describe("Setup and Teardown", () => {
  let testData: any;

  beforeEach(() => {
    // Run before each test
    testData = {
      posts: [createMockPost(), createMockPost()],
      pages: [createMockPage()],
    };
  });

  afterEach(() => {
    // Run after each test
    testData = null;
  });

  it("should have test data available", () => {
    expect(testData.posts).toHaveLength(2);
    expect(testData.pages).toHaveLength(1);
  });

  it("should have fresh test data", () => {
    testData.posts.push(createMockPost());
    expect(testData.posts).toHaveLength(3);
  });

  it("should not persist changes between tests", () => {
    // This test runs after the previous one
    // but testData is reset in beforeEach
    expect(testData.posts).toHaveLength(2);
  });
});

// ============================================
// Snapshot Testing
// ============================================

describe("Snapshot Testing", () => {
  it("should match HTML snapshot", () => {
    const html = `
      <div class="card">
        <h2>Title</h2>
        <p>Content</p>
      </div>
    `;

    const normalized = normalizeHTML(html);
    expect(normalized).toMatchInlineSnapshot(
      '"<div class=\\"card\\"><h2>Title</h2><p>Content</p></div>"',
    );
  });

  it("should match object snapshot", () => {
    const post = createMockPost({
      title: "Snapshot Test",
      slug: "snapshot-test",
    });

    expect(post).toMatchSnapshot();
  });
});

// ============================================
// Error Handling Tests
// ============================================

describe("Error Handling", () => {
  it("should handle thrown errors", () => {
    const throwError = () => {
      throw new Error("Something went wrong");
    };

    expect(throwError).toThrow("Something went wrong");
    expect(throwError).toThrow(Error);
  });

  it("should handle async errors", async () => {
    const asyncError = async () => {
      throw new Error("Async error");
    };

    await expect(asyncError()).rejects.toThrow("Async error");
  });

  it("should validate error types", () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "CustomError";
      }
    }

    const throwCustom = () => {
      throw new CustomError("Custom error");
    };

    expect(throwCustom).toThrow(CustomError);
  });
});

// ============================================
// Parameterized Tests
// ============================================

describe("Parameterized Tests", () => {
  // Test multiple cases with the same logic
  const cases = [
    { input: "hello", expected: "HELLO" },
    { input: "world", expected: "WORLD" },
    { input: "test", expected: "TEST" },
  ];

  cases.forEach(({ input, expected }) => {
    it(`should uppercase "${input}" to "${expected}"`, () => {
      expect(input.toUpperCase()).toBe(expected);
    });
  });
});

// ============================================
// Integration Test Example
// ============================================

describe("Integration Tests", () => {
  it("should fetch and process WordPress posts", async () => {
    // Mock the GraphQL endpoint
    const mockPosts = [
      createMockPost({ title: "Post 1" }),
      createMockPost({ title: "Post 2" }),
    ];

    mockGraphQLFetch({ posts: { nodes: mockPosts } });

    // Simulate fetching posts
    const response = await fetch("https://example.com/graphql");
    const { data } = await response.json();

    // Process posts (example logic)
    const titles = data.posts.nodes.map((post: any) => post.title);

    expect(titles).toEqual(["Post 1", "Post 2"]);
    expect(data.posts.nodes).toHaveLength(2);
  });
});
