export const Schema = z.object({
  世界: z
    .object({
      当前车号: z.coerce
        .number()
        .transform((value) => _.clamp(value, 1, 9))
        .prefault(1),
      当前站: z.string().prefault('朝雾'),
      下一站: z.string().prefault('樱坂'),
      时段: z.enum(['早高峰', '白天', '晚高峰']).prefault('早高峰'),
      在场: z.array(z.string()).prefault([]),
    })
    .prefault({}),
  局势: z
    .object({
      当前目标: z.string().prefault(''),
      异常度: z.coerce
        .number()
        .transform((value) => _.clamp(value, 0, 100))
        .prefault(0),
      压制: z.enum(['展开', '收起']).prefault('展开'),
      地点: z.enum(['车厢', '站台', '站内厕所', '酒店', '她家']).prefault('车厢'),
      她的认知: z.enum(['以为只是没人管', '确认只有自己看得见']).prefault('以为只是没人管'),
    })
    .prefault({}),
  人物: z
    .record(
      z.string(),
      z.object({
        沦陷值: z.coerce
          .number()
          .transform((value) => _.clamp(value, 0, 100))
          .prefault(0),
        认知: z.enum(['以为只是没人管', '确认只有自己看得见']).prefault('以为只是没人管'),
        遭遇: z.coerce.number().prefault(0),
        释放: z.coerce.number().prefault(0),
        衣物状态: z.string().prefault('整齐'),
        身体状态: z.string().prefault('平稳'),
      }),
    )
    .prefault({}),
});

export type SchemaType = z.infer<typeof Schema>;
