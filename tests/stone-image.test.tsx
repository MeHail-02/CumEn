import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoneImage } from '../src/components/StoneImage';

describe('StoneImage', () => {
  it('uses a local fallback if a catalog image cannot load', () => {
    render(<StoneImage src="/missing.webp" alt="Тестовый камень" />);
    const image = screen.getByRole('img', { name: 'Тестовый камень' });

    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/stone-placeholder.webp');
  });
});
