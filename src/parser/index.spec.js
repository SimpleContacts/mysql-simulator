const sqlParser = require('./index').parse;

describe('Read documentation', () => {
  it('can create "create table" parser', () => {
    const result = sqlParser(
      `
      CREATE TABLE users (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(128),
        email VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
    `,
    );

    expect(result[0].create).toBe(true);
    expect(result[0].tbl_name).toBe('users');
  });

  it('can read SELECT statements', () => {
    const result = sqlParser(
      `
      SELECT
      exams.status,
    	users.name,
      orders.id as order_id,
    	orders.order_no,
    	orders.shipping_address,
    	orders.left_lens_upc,
    	orders.right_lens_upc,
      orders.left_rx,
      orders.right_rx,
      1 as leftQty,
      1 as rightQty,
      v2_left_product_id as leftProductId,
      v2_right_product_id as rightProductId,
      shipping_options.label as shippingOption,
      asdsd.*
    FROM
    	users,
      orders,
      shipping_options,
      exams
    WHERE
	    orders.exam_id = exams.id AND
    	orders.has_dx = true AND
    	orders.user_id = ? AND
    	orders.dx_shipping_option_id = shipping_options.id AND
    	dx_left_lens_distributor_order_id is NULL AND
      dx_right_lens_distributor_order_id is NULL AND
      (
        orders.status = 'OPEN' OR
        orders.status = 'PROBLEM_WITH_DISTRIBUTOR' OR
        orders.status = 'OPEN_DX' OR
        orders.status = 'DX_USER_COMPLETE'
      ) AND
      NOT exams.status = 'PRESCREEN_FAILED'
      GROUP BY foo, foo.bar
      ORDER BY asd, as.asd ASC
      LIMIT 100 OFFSET 1000;
    `,
    );

    expect(result[0].select).toBe(true);
    expect(result[0].whereCondition.length).toBe(8); // total root level conditions
    expect(result[0].whereCondition[6].expr.length).toBe(4); // the condition in parens
  });
});

// import db from 'server/db2';
// const result = await db.query("SELECT * from asdasd");
