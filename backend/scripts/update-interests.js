require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const connectDB = require('../config/database');

async function run() {
    await connectDB();
    const items = [
        {
            id: 'phim-bo',
            title: 'Phim Bộ',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=phim-bo',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4338ca 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20260620-1/00083387b890aaac69f0490b3fda8c13.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
        },
        {
            id: 'phim-moi',
            title: 'Phim Mới',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=phim-moi-cap-nhat',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>'
        },
        {
            id: 'hanh-dong',
            title: 'Hành Động',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=hanh-dong',
            color: '#f97316',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
        },
        {
            id: 'tinh-cam',
            title: 'Tình Cảm',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=tinh-cam',
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250901-1/377ca3402a12c55372f0145f49c0e4a5.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>'
        },
        {
            id: 'hai-huoc',
            title: 'Hài Hước',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=hai-huoc',
            color: '#eab308',
            gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 55%, #854d0e 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M8 14c1.5 2 6.5 2 8 0M9 9h.01M15 9h.01"></path></svg>'
        },
        {
            id: 'hoat-hinh',
            title: 'Hoạt Hình',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=hoat-hinh',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 55%, #065f46 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        }
    ];

    await Setting.findOneAndUpdate({}, { $set: { desktop_interests: items } }, { upsert: true });
    console.log('✅ UPDATED_DESKTOP_INTERESTS_SUCCESS');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
