import { createClient } from '@supabase/supabase-js';
import Logger, { LogExecution } from './logger.js';

class SupabaseClient {
  constructor() {
    this.logger = new Logger('Supabase');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Missing Supabase configuration');
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY required');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    this.logger.info('Supabase client initialized');
  }

  async initializeTables() {
    try {
      // Pages table
      await this.client.rpc('create_tables_if_not_exists', {
        sql: `
          CREATE TABLE IF NOT EXISTS pages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR NOT NULL,
            slug VARCHAR UNIQUE NOT NULL,
            content JSONB DEFAULT '{}',
            hero_title VARCHAR,
            hero_subtitle VARCHAR,
            hero_image VARCHAR,
            is_published BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS navigation_links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            label VARCHAR NOT NULL,
            url VARCHAR NOT NULL,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
            type VARCHAR NOT NULL,
            content JSONB NOT NULL,
            position JSONB DEFAULT '{"x": 0, "y": 0}',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR UNIQUE NOT NULL,
            password_hash VARCHAR NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });
      this.logger.info('Database tables initialized');
    } catch (error) {
      this.logger.warn('Tables may already exist', { error: error.message });
    }
  }

  async createPage(data) {
    const { error, data: page } = await this.client
      .from('pages')
      .insert([data])
      .select();

    if (error) throw error;
    return page[0];
  }

  async updatePage(id, data) {
    const { error, data: page } = await this.client
      .from('pages')
      .update({ ...data, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return page[0];
  }

  async getPage(idOrSlug, isSlug = false) {
    const query = this.client.from('pages').select('*');
    
    if (isSlug) {
      query.eq('slug', idOrSlug);
    } else {
      query.eq('id', idOrSlug);
    }

    const { error, data } = await query.single();
    if (error) throw error;
    return data;
  }

  async getAllPages() {
    const { error, data } = await this.client
      .from('pages')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async deletePage(id) {
    const { error } = await this.client
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async upsertNavigationLink(label, url, orderIndex = 0) {
    const { error, data } = await this.client
      .from('navigation_links')
      .upsert({
        label,
        url,
        order_index: orderIndex
      }, { onConflict: 'label' })
      .select();

    if (error) throw error;
    return data[0];
  }

  async getNavigationLinks() {
    const { error, data } = await this.client
      .from('navigation_links')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createAsset(pageId, type, content, position) {
    const { error, data } = await this.client
      .from('assets')
      .insert([{ page_id: pageId, type, content, position }])
      .select();

    if (error) throw error;
    return data[0];
  }

  async getPageAssets(pageId) {
    const { error, data } = await this.client
      .from('assets')
      .select('*')
      .eq('page_id', pageId);

    if (error) throw error;
    return data;
  }

  async updateAssetPosition(assetId, position) {
    const { error, data } = await this.client
      .from('assets')
      .update({ position })
      .eq('id', assetId)
      .select();

    if (error) throw error;
    return data[0];
  }

  async deleteAsset(assetId) {
    const { error } = await this.client
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  }

  async getAdminUser(email) {
    const { error, data } = await this.client
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createAdminUser(email, passwordHash) {
    const { error, data } = await this.client
      .from('admin_users')
      .insert([{ email, password_hash: passwordHash }])
      .select();

    if (error) throw error;
    return data[0];
  }
}

export default SupabaseClient;
