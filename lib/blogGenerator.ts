import slugify from 'slugify';
import { Blog, IBlog } from './models/Blog';

/** Auto-generate a placeholder blog (used when the collection is empty). */
export async function generateBlog(): Promise<IBlog | null> {
  try {
    const title = 'Personal Loan Guide ' + Math.floor(Math.random() * 10000);
    const slug = slugify(title, { lower: true });

    const exists = await Blog.findOne({ slug });
    if (exists) return null;

    const blog = await Blog.create({
      title,
      slug,
      category: 'Personal Loan',
      excerpt: 'Complete guide for personal loans in India.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      content: `
        <h1>${title}</h1>
        <p>This is auto generated blog.</p>
        <h2>Eligibility</h2>
        <ul>
          <li>Income ₹15,000+</li>
          <li>CIBIL 700+</li>
        </ul>
        <h2>Benefits</h2>
        <ul>
          <li>Quick approval</li>
          <li>Low interest</li>
        </ul>
        <h2>Apply Now</h2>
        <p><a href="https://www.ezyloan.co.in">Apply Here</a></p>
      `,
    });

    return blog;
  } catch (error) {
    console.error('❌ Generate blog error:', error);
    return null;
  }
}
